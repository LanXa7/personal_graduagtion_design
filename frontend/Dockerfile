FROM ubuntu:latest
LABEL authors="LanXa7"
# 使用官方的 Nginx 镜像作为基础镜像
FROM nginx:alpine

# 将构建好的 Vue 项目文件复制到 Nginx 的默认静态文件目录
COPY dist /usr/share/nginx/html

# 将自定义的 Nginx 配置文件复制到容器中
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /etc/nginx/ssl && chmod 700 /etc/nginx/ssl

COPY cert/wdxlanxa7.xyz.key /etc/nginx/ssl
COPY cert/wdxlanxa7.xyz.pem /etc/nginx/ssl

# 暴露 80 端口
EXPOSE 80 443

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]

