# connect

import json  
import boto3  
import os  
dynamodb = boto3.client('dynamodb')
dynamodb1 = boto3.resource('dynamodb')

def lambda_handler(event, context):  
    connectionId = event['requestContext']['connectionId'] 
    email = event['queryStringParameters']['email']
    print(email)
    
    item = {  
        'connectionId': {'S': connectionId},  
        'email': {'S': email}  
    } 
    
    dynamodb.put_item(TableName=os.environ['WEBSOCKET_TABLE'],
        Item=item
    )
      
    table = dynamodb1.Table('sns-conncetions')  
    table.put_item(  
        Item={  
        'connectionId': connectionId,  
        'email': email  
        }  
    )  

    return {} 









# disconnect

import json
import boto3
import os
dynamodb = boto3.client('dynamodb')
def lambda_handler(event, context):   
   connectionId = event['requestContext']['connectionId'] 
   dynamodb.delete_item(TableName=os.environ['WEBSOCKET_TABLE'],
   Key={'connectionId': {'S' : connectionId}}
   ) 
   return {}



# sendpub

import json
import boto3
import os
dynamodb=boto3.client('dynamodb')
sqs = boto3.client('sqs')
 
 
def lambda_handler(event, context): 
   queue_url = 'https://sqs.us-east-1.amazonaws.com/211125746519/myqueue'
   message = json.loads(event['body'])['message'] 
   # connectionId=json.loads(event['body'])['id']
   connectionId = event['requestContext']['connectionId']
   message_id = event['requestContext']['connectionId']
   dynamodb1 = boto3.resource('dynamodb')  
   table = dynamodb1.Table('websocket-connection')  
   response = table.get_item(  
      Key={  
            'connectionId': connectionId  
      }  
   )  
   email = response['Item']['email']
   if len(email) >= 5:  
      substring = email[0:5]  
   else:  
      substring = email[0]
   post_message=substring+" (Public)" + " : "+message
   print(event)
   print(context)
   paginator = dynamodb.get_paginator('scan') 
   connectionIds = [] 
   apigatewaymanagementapi = boto3.client( 
       'apigatewaymanagementapi',   
       endpoint_url = "https://"+ event["requestContext"]["domainName"] + "/" + event["requestContext"]["stage"] 
   )
   for page in paginator.paginate(TableName=os.environ['WEBSOCKET_TABLE']):
        connectionIds.extend(page['Items'])
   # connectionIds=json.loads(event['body'])['id']
   for connectionId in connectionIds:
      apigatewaymanagementapi.post_to_connection( 
           Data=post_message,   
          ConnectionId=connectionId['connectionId']['S'] 
      )  
 
   response = sqs.send_message(  
         QueueUrl=queue_url,  
         MessageBody=message,
         MessageAttributes={
            "info":{
               "DataType": "String",
               "StringValue":message_id
            }
         }
   )
   return {}





# sendprivate


import json
import boto3
import os

def lambda_handler(event, context):
    
    print(event)
    
    message = json.loads(event['body'])['message'] 
    connectionId=json.loads(event['body'])['id']
    message_id = event['requestContext']['connectionId'] 
    dynamodb = boto3.resource('dynamodb')  
    table = dynamodb.Table('websocket-connection')  
      
    response = table.get_item(  
        Key={  
            'connectionId': message_id  
        }  
    )  
      
    email = response['Item']['email']
    if len(email) >= 5:  
        substring = email[0:5]  
    else:  
        substring = email[0] 
    post_message=substring+" : "+message
    
    apigatewaymanagementapi = boto3.client( 
       'apigatewaymanagementapi',   
       endpoint_url = "https://"+ event["requestContext"]["domainName"] + "/" + event["requestContext"]["stage"] 
    )
    
    apigatewaymanagementapi.post_to_connection( 
          Data= post_message,   
          ConnectionId= connectionId
    )  
    # TODO implement
    return { }




# sqslambda


import json
import boto3
import os

dynamodb1 = boto3.resource('dynamodb')

def lambda_handler(event, context):
   
   message =  json.dumps(event['Records'][0]['body'])
   
   message_id = json.dumps(event['Records'][0]['messageId'])  
   
   sender_id = json.dumps(event['Records'][0]['messageAttributes']['info']['stringValue'])
   
   print(sender_id)
   
   table = dynamodb1.Table('chats')
   table.put_item(  
        Item={  
            'messageId': message_id,  
            'message': message,
            'senderId': sender_id
        }  
    ) 
   print(event)
   records=event['Records']
   
   for record in records:
       body=record['body']
       print(body)




# sns 

import boto3
def lambda_handler(event, context):  
    print(event)
    
    # Get the new user details from the DynamoDB event  
    new_user = event['Records'][0]['dynamodb']['NewImage']  
    user_id = new_user['connectionId']['S']  
    email = new_user['email']['S']  
   
    # Create an SNS client  
    sns_client = boto3.client('sns')  
      
    # Create a new subscription for the user  
    response = sns_client.subscribe(  
        TopicArn='arn:aws:sns:us-east-1:211125746519:SNSTopic',  # Replace with your SNS topic ARN  
        Protocol='email',  
        Endpoint=email  
    )
    
    message = "New user added: User ID: "+user_id+ "\nEmail: "+email  
    sns_client.publish(  
        TopicArn='arn:aws:sns:us-east-1:211125746519:SNSTopic',  # Replace with your SNS topic ARN  
        Message=message  
    )  
      
    # Print the subscription ARN for debugging  
    print(response['SubscriptionArn'])  
      
    # Return a response  
    return {  
        'statusCode': 200,  
        'body': 'User added to subscription successfully'  
    }  

