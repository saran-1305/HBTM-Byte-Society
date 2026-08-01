import asyncio
import asyncpg
import uuid

async def seed():
    conn = await asyncpg.connect(
        user='postgres',
        password='Saran@130507',
        database='hbtm',
        host='localhost',
        port=5432
    )
    
    mock_id = '123e4567-e89b-12d3-a456-426614174000'
    
    row = await conn.fetchrow('SELECT id FROM users WHERE id = $1::uuid', mock_id)
    if not row:
        await conn.execute(
            'INSERT INTO users (id, email, hashed_password) VALUES ($1::uuid, $2, $3)',
            mock_id, 'mockuser@hbtm.local', 'fake_hash'
        )
        print('Mock user created successfully in DB via raw SQL!')
    else:
        print('Mock user already exists.')
        
    await conn.close()

asyncio.run(seed())
