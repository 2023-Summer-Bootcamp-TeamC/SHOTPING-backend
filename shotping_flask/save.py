from sqlalchemy import create_engine, Table, MetaData, Column, String, INTEGER
from sqlalchemy.orm import sessionmaker

def save_image(id, prediction):
    engine = create_engine("mysql+pymysql://user:1234@localhost/database")
    
    # 세션 생성
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # 메타데이터 생성
    metadata = MetaData()
    metadata.reflect(bind=engine)

    # 테이블 생성 (이미 있다면 생성 X)
    data = Table(
        'data',
        metadata,
        Column('id', INTEGER, primary_key=True),
        Column('image_url', String(100)),
        Column('result', String(100)),
        extend_existing=True
    )
    
    metadata.create_all(engine)

    try:
        # 데이터 수정
        if session.query(data).filter_by(id=id).first():
            update_stmt = data.update().where(data.c.id==id).values(result=prediction)
            session.execute(update_stmt)
        # id가 없다면, 데이터 삽입
        else:
            insert_stmt = data.insert().values(id=id, result=prediction)
            session.execute(insert_stmt)

        session.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
        session.rollback()
    finally:
        session.close()