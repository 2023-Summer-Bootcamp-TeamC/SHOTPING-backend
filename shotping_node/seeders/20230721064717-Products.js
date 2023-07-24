'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const data = [
      {
        id: "1",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/1.png",
        product_name: "[탄단지] 닭가슴살 현미 삼각주먹밥 500g 3종 (택1)",
        product_price: 6500,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "2",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/2.png",
        product_name: "[Shotping's] 마시는 플레인 요거트 750mL",
        product_price: 7480,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "3",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/3.png",
        product_name: "[어니스트] 그릭요거트 플레인 오리지널 100g",
        product_price: 3700,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "4",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/4.png",
        product_name: "[치즈] 프로바이오요거트 딸기 900mL",
        product_price: 7400,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "5",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/5.png",
        product_name: "상품명1",
        product_price: 1000,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "6",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/6.png",
        product_name: "[브레댄코] 흑임자 케이크",
        product_price: 29900,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "7",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/7.png",
        product_name: "조선향미 4kg",
        product_price: 25900,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "8",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/8.png",
        product_name: "[목장] 플레인 요거트 500mL",
        product_price: 12000,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "9",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/9.png",
        product_name: "[닥터넛츠]국산 밤 양갱",
        product_price: 6500,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "10",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/10.png",
        product_name: "상품명2",
        product_price: 2500,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "11",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/11.png",
        product_name: "[그릭데이] 그릭요거트 시그니처 450g",
        product_price: 12150,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "12",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/12.png",
        product_name: "[장어] 스틱 30포",
        product_price: 22900,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "13",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/13.png",
        product_name: "[테일러] 애프터 딥워터 3종 (택1)",
        product_price: 17500,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "14",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/14.png",
        product_name: "[서주] 딸기 생크림빵 (3개입)",
        product_price: 10500,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "15",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/15.png",
        product_name: "[군산 이성당] 1945카스테라 러브베어",
        product_price: 14000,
        product_stock: 100,
        product_buy: 0,
      },
      {
        id: "16",
        image_url: "https://bootcamp-shotping.s3.ap-northeast-2.amazonaws.com/photosave/16.png",
        product_name: "[리틀넥] 스테이크 키트",
        product_price: 19800,
        product_stock: 100,
        product_buy: 0,
      }
    ]
    await queryInterface.bulkInsert('Products', data, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};
