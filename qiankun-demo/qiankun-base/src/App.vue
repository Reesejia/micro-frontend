<template>
  <div>
    <el-menu :router="true" mode="horizontal">
      <!-- 基座中够可以放自己的路由, -->
      <el-menu-item index="/">Home</el-menu-item>
      <!-- 也可以放其他子应用 -->
      <el-menu-item index="/vue">vue应用</el-menu-item>
      <el-menu-item index="/react">react应用</el-menu-item>
    </el-menu>
    <!-- 展示主应用默认情况 -->
    <router-view></router-view>
    <div id="vue"></div>
    <div id="react"></div>
  </div>
</template>

<style></style>
