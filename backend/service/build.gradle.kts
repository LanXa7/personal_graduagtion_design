plugins {
    id("spring-conventions")
    id("test-conventions")
}

dependencies {
    api(projects.model)
    ksp(libs.jimmer.ksp)
    implementation(libs.jimmer.sql.kotlin)
    // sa-token
    implementation(libs.sa.token.spring.boot3.starter)
    // jwt
    implementation(libs.sa.token.jwt)
    // redisson
    implementation(libs.redisson.spring.boot.starter)
    // validation
    implementation(libs.spring.boot.starter.validation)
    // jimmer starter
    implementation(libs.jimmer.spring.boot.starter)
    // rabbitmq
    implementation(libs.ampq)
    // minio
    implementation(libs.minio)
    // fast-excel
    implementation(libs.fastexcel)
    // kotlin-logger
    implementation(libs.logging)
    // mail
    implementation(libs.mail)
    // aop
    implementation(libs.aop)
    // okhttp3
    implementation(libs.okhttp3)
    // spring-statemachine
    implementation(libs.spring.statemachine.starter)
    // kotlin coroutines
    implementation(libs.kotlinx.coroutines.core)
    // flyway
    implementation(libs.flyway)
    implementation(libs.flyway.database.postgresql)
    // protobuf
    implementation(libs.protobuf)
    // ijpay-alipay
    implementation(libs.ijpay.alipay.spring.boot.starters)
    implementation(libs.postgresql)
    implementation(libs.websocket)
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
}
