import AWS from 'aws-sdk'
import VError from 'verror'
import { ServiceComponentTable } from 'utils/const'

export const getComponents = () => {
  const { AWS_REGION: region } = process.env
  const awsDynamoDb = new AWS.DynamoDB({ region })

  return new Promise((resolve, reject) => {
    const params = {
      TableName: ServiceComponentTable,
      ProjectionExpression: 'componentID, description, #nm, #st',
      ExpressionAttributeNames: {
        '#nm': 'name',
        '#st': 'status'
      }
    }
    awsDynamoDb.scan(params, (err, scanResult) => {
      if (err) {
        return reject(new VError(err, 'DynamoDB'))
      }
      let components = []
      scanResult.Items.forEach((component) => {
        const {
          componentID: {
            S: compID
          },
          name: {
            S: compName
          },
          status: {
            S: compStatus
          },
          description: {
            S: compDesc
          }
        } = component
        components.push({
          componentID: compID,
          name: compName,
          status: compStatus,
          description: compDesc
        })
      })

      resolve(components)
    })
  })
}

export const updateComponent = (id, name, description, status) => {
  const { AWS_REGION: region } = process.env
  const awsDynamoDb = new AWS.DynamoDB.DocumentClient({ region })

  return new Promise((resolve, reject) => {
    const params = {
      Key: {
        componentID: id
      },
      UpdateExpression: 'set #n = :n, description = :d, #s = :s',
      ExpressionAttributeNames: {
        '#n': 'name',
        '#s': 'status'
      },
      ExpressionAttributeValues: {
        ':n': name,
        ':d': description,
        ':s': status
      },
      TableName: ServiceComponentTable,
      ReturnValues: 'ALL_NEW'
    }
    awsDynamoDb.update(params, (err, data) => {
      if (err) {
        return reject(new VError(err, 'DynamoDB'))
      }
      resolve(data)
    })
  })
}

export const updateComponentStatus = (id, status) => {
  const { AWS_REGION: region } = process.env
  const awsDynamoDb = new AWS.DynamoDB.DocumentClient({ region })

  return new Promise((resolve, reject) => {
    const params = {
      Key: {
        componentID: id
      },
      UpdateExpression: 'set #s = :s',
      ExpressionAttributeNames: {
        '#s': 'status'
      },
      ExpressionAttributeValues: {
        ':s': status
      },
      TableName: ServiceComponentTable,
      ReturnValues: 'ALL_NEW'
    }
    awsDynamoDb.update(params, (err, data) => {
      if (err) {
        return reject(new VError(err, 'DynamoDB'))
      }
      resolve(data)
    })
  })
}

export const deleteComponent = (id) => {
  const { AWS_REGION: region } = process.env
  const awsDynamoDb = new AWS.DynamoDB.DocumentClient({ region })

  return new Promise((resolve, reject) => {
    const params = {
      Key: {
        componentID: id
      },
      TableName: ServiceComponentTable,
      ReturnValues: 'NONE',
      ConditionExpression: 'attribute_exists(componentID)'
    }
    awsDynamoDb.delete(params, (err, data) => {
      if (err) {
        return reject(new VError(err, 'DynamoDB'))
      }
      resolve(data)
    })
  })
}