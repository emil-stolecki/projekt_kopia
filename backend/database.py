import datetime
import json

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from bson import json_util
import json
import os

import pandas as pd

class Database:


    def __init__(self):
        # załadowanie zmiennych środowiskowych
        load_dotenv()



    def save_feedback(self,feedback):

        obj = dict(feedback)
        client, collection = self.__connect()
        try:
            collection.insert_one(obj)
        except Exception as e:
            print(e)
        client.close()



    def read_feedback(self, page, filter, limit):
        records_per_page = limit

        results = []
        count = 0

        query={}
        if filter.get("startDate") or filter.get("endDate"):
            query["date"] = {}
            if filter.get("startDate"):
                query["date"]["$gte"] = datetime.datetime.fromisoformat(filter.get("startDate"))
            if filter.get("endDate"):
                query["date"]["$lte"] = datetime.datetime.fromisoformat(filter.get("endDate"))

        if filter.get("minNumber") or filter.get("maxNumber") or filter.get("minLength") or filter.get("maxLength"):
            query["$expr"] = {"$and":[]}
            if filter.get("minNumber"):
                query["$expr"]["$and"].append({ "$gte": [{ "$size": "$references" },int(filter.get("minNumber"))]})
            if filter.get("maxNumber"):
                query["$expr"]["$and"].append({ "$lte": [{ "$size": "$references" },int(filter.get("maxNumber"))]})

            if filter.get("minLength"):
                query["$expr"]["$and"].append({ "$eq": [{ "$size": "$references" }, 1] })
                query["$expr"]["$and"].append({ "$gte": [{ "$strLenCP": { "$arrayElemAt": ["$references.text", 0] } },int(filter.get("minLength"))]})
            if filter.get("maxLength"):
                query["$expr"]["$and"].append({ "$eq": [{ "$size": "$references" }, 1] })
                query["$expr"]["$and"].append({ "$lte": [{ "$strLenCP": { "$arrayElemAt": ["$references.text", 0] } },int(filter.get("maxLength"))]})

        if filter.get("correction") is not None:
            if filter.get("correction")==1:
                if query.get("$expr") is None:
                    query["$expr"] = {"$and": []}
                query["corrected"] = {"$exists": True}
                query["$expr"]["$and"].append({"$eq": [{"$type": "$corrected"}, "object"]})
                query["$expr"]["$and"].append({"$gt": [{"$size": {"$objectToArray": "$corrected"}}, 0]})

            if filter.get("correction") == 0:
                query["$or"] = [
                    {"corrected": {"$exists": False}},
                    {"$expr": {
                        "$or": [
                            {"$ne": [{"$type": "$corrected"}, "object"]},
                            {"$eq": [{"$size": {"$objectToArray": "$corrected"}}, 0]}
                        ]
                    }}
                ]

        if filter.get("comment") is not None:
            if filter.get("comment")==1:
                if query.get("$expr") is None:
                    query["$expr"] = {"$and": []}
                query["opinion"] = {"$exists": True}
                query["$expr"]["$and"].append({"$eq": [{"$type": "$opinion"}, "string"]})
                query["$expr"]["$and"].append({"$gt": [{"$strLenCP":"$opinion"}, 0]})

            if filter.get("comment") == 0:
                query["$or"] = [
                    {"opinion": {"$exists": False}},
                    {"$expr": {
                        "$or": [
                            {"$ne": [{"$type": "$opinion"}, "string"]},
                            {"$eq": [{"$strLenCP": "$opinion"}, 0]}
                        ]
                    }}
                ]

        if filter.get("language"):
            query["references.results.language"] = {"$elemMatch":{"$elemMatch":{"$eq":filter.get("language")}}}

        if filter.get("words"):
            regex_pattern = "(?=.*{})".format("".join(f"(?=.*{word})" for word in filter.get("words")))
            query["references.text"] = {"$regex": regex_pattern}

        client, collection = self.__connect()

        try:
            results = list(collection.find(query,limit=records_per_page, skip=records_per_page*page))
            count = collection.count_documents(query)
        except Exception as e:
            print(e)

        client.close()
        return results,count

    def read_feedback_with_query(self,page,query,limit):

        records_per_page = limit
        results = []
        count = 0

        client, collection = self.__connect()
        try:
            results = list(collection.find(query,limit=records_per_page, skip=records_per_page*page))
            count = collection.count_documents(query)


        except Exception as e:
            print(e)

        client.close()

        return results, count

    def __connect(self):
        name = os.environ.get("NAME")
        password = os.environ.get("PASSWORD")

        uri = "mongodb://{}:{}@0.0.0.0:27017".format(name, password)
        client = MongoClient(uri, server_api=ServerApi('1'))
        database = client['App']
        collection = database['Feedback']

        return client, collection


    # dane wyselekcjonowane z bazy danych zostana w całości zapisane w formacie json
    def __save_to_json(self, data):

        f = open(os.path.join('saved', 'data.json'), 'w')
        f.write(json_util.dumps(data))

    #dane zostaną zapisane w formacie csv, biorąc pod uwagę tylko atrybuty potrzebne do trenowania
    def __save_to_dataframe(self,data):
        emotions=["anger","disgust","fear","joy","neutral","sadness","surprise"]
        df = pd.DataFrame(columns=["text","language","is_toxic","sentiment"]+emotions)
        for line in data:

            new_row = {}
            new_row["text"] = line["references"][0]["text"]
            if len(line["corrected"]) > 0:
                new_row["language"] = line["corrected"]["language"],
                new_row["is_toxic"] = line["corrected"]["toxic"],
                new_row["sentiment"] = line["corrected"]["sentiment"]


                for emotion in line["corrected"]["emotion"]:
                    new_row[emotion] = 1

            df.loc[len(df)] = new_row



        df = df.fillna(0)


        df.to_csv(os.path.join('saved','data.csv'))
        return df


    def save_data(self,page,query,limit):
        records_per_page = limit
        results = []

        client, collection = self.__connect()

        try:
            results = list(collection.find(query,limit=records_per_page, skip=records_per_page*page))

        except Exception as e:
            print(e)

        client.close()
        self.__save_to_json(results)
        self.__save_to_dataframe(results)









