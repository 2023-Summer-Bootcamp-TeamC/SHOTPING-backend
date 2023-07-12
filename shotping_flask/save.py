from sqlalchemy import create_engine, Table, MetaData, Column, String, INTEGER
from sqlalchemy.orm import sessionmaker
import os

def save_image(id, prediction):
    # engine = create_engine(f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@{os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DATABASE')}")

    engine = create_engine("mysql+pymysql://user:1234@shotping-mysql.co7pnzdwwqty.ap-southeast-2.rds.amazonaws.com/shotping")
    
    # 세션 생성
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # 메타데이터 생성
    metadata = MetaData()
    metadata.reflect(bind=engine)
    # 이미 있는 테이블에 연결
    data = Table('recogimgs', metadata, autoload_with=engine)

    try:
        # 데이터 수정
        if session.query(data).filter_by(id=id).first():
            update_stmt = data.update().where(data.c.id==id).values(ai_predict=prediction)
            session.execute(update_stmt)
        # id가 없다면, 데이터 삽입
        else:
            insert_stmt = data.insert().values(id=id, ai_predict=prediction)
            session.execute(insert_stmt)

        session.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
        session.rollback()
    finally:
        session.close()