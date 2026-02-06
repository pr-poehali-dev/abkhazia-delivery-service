import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import boto3
import base64
import uuid

def handler(event: dict, context) -> dict:
    """API для управления заказами доставки"""
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
        
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            order_id = query_params.get('id')
            order_number = query_params.get('number')
            
            if order_number:
                cursor.execute("""
                    SELECT o.*, s.name as status_name, s.color as status_color,
                           pp.name as pickup_point_name, pp.city as pickup_city,
                           dp.name as delivery_point_name
                    FROM orders o
                    LEFT JOIN order_statuses s ON o.status_id = s.id
                    LEFT JOIN pickup_points pp ON o.pickup_point_id = pp.id
                    LEFT JOIN delivery_points dp ON o.delivery_point_id = dp.id
                    WHERE o.order_number = %s
                """, (order_number,))
                order = cursor.fetchone()
                
                if not order:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Заказ не найден'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(order), default=str),
                    'isBase64Encoded': False
                }
            
            elif order_id:
                cursor.execute("""
                    SELECT o.*, s.name as status_name, s.color as status_color,
                           pp.name as pickup_point_name, pp.city as pickup_city,
                           dp.name as delivery_point_name
                    FROM orders o
                    LEFT JOIN order_statuses s ON o.status_id = s.id
                    LEFT JOIN pickup_points pp ON o.pickup_point_id = pp.id
                    LEFT JOIN delivery_points dp ON o.delivery_point_id = dp.id
                    WHERE o.id = %s
                """, (order_id,))
                order = cursor.fetchone()
                
                if not order:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Заказ не найден'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(order), default=str),
                    'isBase64Encoded': False
                }
            
            else:
                cursor.execute("""
                    SELECT o.*, s.name as status_name, s.color as status_color,
                           pp.name as pickup_point_name, pp.city as pickup_city,
                           dp.name as delivery_point_name
                    FROM orders o
                    LEFT JOIN order_statuses s ON o.status_id = s.id
                    LEFT JOIN pickup_points pp ON o.pickup_point_id = pp.id
                    LEFT JOIN delivery_points dp ON o.delivery_point_id = dp.id
                    ORDER BY o.created_at DESC
                    LIMIT 100
                """)
                orders = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(order) for order in orders], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            full_name = body.get('full_name')
            phone = body.get('phone')
            pickup_point_id = body.get('pickup_point_id')
            delivery_type = body.get('delivery_type')
            delivery_address = body.get('delivery_address')
            delivery_point_id = body.get('delivery_point_id')
            weight = body.get('weight')
            length = body.get('length')
            width = body.get('width')
            height = body.get('height')
            price = body.get('price')
            qr_screenshot_base64 = body.get('qr_screenshot')
            
            if not full_name or not phone or not pickup_point_id or not delivery_type:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все обязательные поля'}),
                    'isBase64Encoded': False
                }
            
            if delivery_type == 'home' and not delivery_address:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Укажите адрес доставки'}),
                    'isBase64Encoded': False
                }
            
            if delivery_type == 'pickup' and not delivery_point_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Выберите пункт выдачи'}),
                    'isBase64Encoded': False
                }
            
            order_number = f"#{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"
            
            qr_url = None
            if qr_screenshot_base64:
                try:
                    s3 = boto3.client('s3',
                        endpoint_url='https://bucket.poehali.dev',
                        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                    )
                    
                    image_data = base64.b64decode(qr_screenshot_base64.split(',')[1] if ',' in qr_screenshot_base64 else qr_screenshot_base64)
                    file_key = f"orders/{order_number}.png"
                    
                    s3.put_object(
                        Bucket='files',
                        Key=file_key,
                        Body=image_data,
                        ContentType='image/png'
                    )
                    
                    qr_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
                except Exception as e:
                    print(f"Error uploading image: {e}")
            
            cursor.execute("SELECT id FROM order_statuses WHERE name = %s", ('Обработка',))
            status = cursor.fetchone()
            status_id = status['id'] if status else 1
            
            cursor.execute("""
                INSERT INTO orders (
                    order_number, full_name, phone, pickup_point_id, 
                    delivery_type, delivery_address, delivery_point_id,
                    weight, length, width, height, price,
                    qr_screenshot_url, status_id
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, order_number
            """, (
                order_number, full_name, phone, pickup_point_id,
                delivery_type, delivery_address, delivery_point_id,
                weight, length, width, height, price,
                qr_url, status_id
            ))
            
            new_order = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'order_id': new_order['id'],
                    'order_number': new_order['order_number']
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            order_id = body.get('id')
            status_id = body.get('status_id')
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID заказа обязателен'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "UPDATE orders SET status_id = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (status_id, order_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            order_id = body.get('id')
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID заказа обязателен'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("DELETE FROM orders WHERE id = %s", (order_id,))
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
