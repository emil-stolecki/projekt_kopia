import datetime

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi


class Database:
    def __init__(self,name,password):

        #uri = "mongodb+srv://{}:{}@cluster0.czx1qt2.mongodb.net/?retryWrites=true&w=majority".format(name, password)
        uri = "mongodb://{}:{}@0.0.0.0:27017".format(name, password)
        self.client = MongoClient(uri, server_api=ServerApi('1'))
        self.database = self.client['App']
        self.collection = self.database['Feedback']

        try:
            self.client.admin.command('ping')
            print("MongoDB connected")
        except Exception as e:
            print(e)


    def save_feedback(self,feedback):
        obj = dict(feedback)
        print(obj)
        try:
            self.collection.insert_one(obj)
        except Exception as e:
            print(e)



    def read_feedback(self,page,filter):
        records_per_page=10
        print(filter)

        results=[]
        count=0
        test={
            "date":{"$lte": datetime.datetime.today(),"$gt":datetime.datetime(2024,4,14,16,30,0)}
        }

        query={}
        if filter.get("startDate") or filter.get("endDate"):
            query["date"] = {}
            if filter.get("startDate"):
                query["date"]["$gte"] = datetime.datetime.fromisoformat(filter.get("startDate"))
            if filter.get("endDate"):
                query["date"]["$lte"] = datetime.datetime.fromisoformat(filter.get("endDate"))

        if filter.get("minNumber") or filter.get("maxNumber"):
            query["$expr"] = {"$and":[]}
            if filter.get("minNumber"):
                query["$expr"]["$and"].append({ "$gte": [{ "$size": "$references" },int(filter.get("minNumber"))]})


            if filter.get("maxNumber"):
                query["$expr"]["$and"].append({ "$lte": [{ "$size": "$references" },int(filter.get("maxNumber"))]})

        print(query)
        print(test)
        try:
            results = list(self.collection.find(query,limit=records_per_page, skip=records_per_page*page))
            count = self.collection.count_documents(query)


        except Exception as e:
            print(e)

        return (results,count)