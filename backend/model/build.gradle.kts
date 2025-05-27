plugins {
    id("common-conventions")
}

dependencies {
    ksp(libs.jimmer.ksp)
    implementation(libs.jimmer.sql.kotlin)
    //easy-excel
    implementation(libs.fastexcel)

    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
}