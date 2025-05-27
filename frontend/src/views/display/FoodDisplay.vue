<template>
  <div class="food-display">
    <!-- 轮播图部分 -->
    <div class="food-cards">
      <div class="category-section">
        <h2 class="category-title">推荐菜品</h2>
        <el-carousel :interval="4000" type="card" height="400px" class="carousel">
          <el-carousel-item v-for="food in recommendationData.recommendation" :key="food.id">
            <div class="carousel-content">
              <el-image 
                :src="food.picture ? `/api/images${food.picture}` : ''" 
                class="carousel-image"
                fit="cover"
              />
              <div class="carousel-info">
                <span class="carousel-name">{{ food.name }}</span>
                <span class="carousel-price">¥{{ food.price }}</span>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <!-- 其余菜品展示部分 -->
    <div class="food-cards">
      <div class="category-section">
        <h2 class="category-title">其余菜品</h2>
        <template v-if="recommendationData.leftoverFood && recommendationData.leftoverFood.length > 0">
          <div class="cards-container">
            <div v-for="food in recommendationData.leftoverFood" :key="food.id" class="food-card">
              <div class="food-image">
                <el-image 
                  :src="food.picture ? `/api/images${food.picture}` : ''" 
                  class="food-image"
                  fit="cover"
                />
              </div>
              <div class="food-info">
                <span class="food-name">{{ food.name }}</span>
                <span class="food-price">¥{{ food.price }}</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="empty-tip">
            <el-empty description="该摊位暂无更多餐品" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Apis from '@/alova'

interface FoodItem {
  id?: number
  name?: string
  picture?: string
  price?: number
}

interface FoodData {
  recommendation?: FoodItem[]
  leftoverFood?: FoodItem[]
}

const recommendationData = ref<FoodData>({})

const fetchData = async () => {
  try {
    const response = await Apis.FoodController.recommendation()
    recommendationData.value = response
  } catch (error) {
    console.error('获取菜品数据失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.food-display {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.food-cards {
  padding: 20px;
}

.category-section {
  margin-bottom: 40px;
}

.category-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.carousel {
  margin-bottom: 20px;
}

.carousel-content {
  position: relative;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.carousel-name {
  font-size: 20px;
  font-weight: bold;
}

.carousel-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.food-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.food-card:hover {
  transform: translateY(-5px);
}

.food-image {
  height: 200px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-info {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.food-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.empty-tip {
  background: white;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  margin-top: 20px;
}
</style> 