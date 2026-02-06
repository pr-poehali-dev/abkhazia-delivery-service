import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для получения справочных данных (пункты выдачи, статусы)"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query_params = event.get('queryStringParameters') or {}
        data_type = query_params.get('type', 'all')
        
        result = {}
        
        if data_type in ['all', 'pickup_points']:
            cursor.execute("SELECT * FROM pickup_points ORDER BY city, name")
            result['pickup_points'] = [dict(row) for row in cursor.fetchall()]
        
        if data_type in ['all', 'delivery_points']:
            cursor.execute("SELECT * FROM delivery_points ORDER BY name")
            result['delivery_points'] = [dict(row) for row in cursor.fetchall()]
        
        if data_type in ['all', 'statuses']:
            cursor.execute("SELECT * FROM order_statuses ORDER BY id")
            result['statuses'] = [dict(row) for row in cursor.fetchall()]
        
        if method == 'GET':
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'add_pickup_point':
                name = body.get('name')
                city = body.get('city')
                address = body.get('address')
                
                cursor.execute(
                    "INSERT INTO pickup_points (name, city, address) VALUES (%s, %s, %s) RETURNING id",
                    (name, city, address)
                )
                new_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': new_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_delivery_point':
                name = body.get('name')
                address = body.get('address')
                
                cursor.execute(
                    "INSERT INTO delivery_points (name, address) VALUES (%s, %s) RETURNING id",
                    (name, address)
                )
                new_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': new_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_status':
                name = body.get('name')
                color = body.get('color', 'blue')
                
                cursor.execute(
                    "INSERT INTO order_statuses (name, color) VALUES (%s, %s) RETURNING id",
                    (name, color)
                )
                new_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': new_id}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            item_id = body.get('id')
            
            if action == 'delete_pickup_point':
                cursor.execute("DELETE FROM pickup_points WHERE id = %s", (item_id,))
            elif action == 'delete_delivery_point':
                cursor.execute("DELETE FROM delivery_points WHERE id = %s", (item_id,))
            elif action == 'delete_status':
                cursor.execute("DELETE FROM order_statuses WHERE id = %s", (item_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
