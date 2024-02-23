from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

class Database:
    def __init__(self,name,password):

        uri = "mongodb+srv://{}:{}@cluster0.czx1qt2.mongodb.net/?retryWrites=true&w=majority".format(name, password)

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
        try:
            self.collection.insert_one(obj)
        except Exception as e:
            print(e)




#zrobić gdzieś exit handler