package com.example.model.entity.user

import com.example.model.common.BaseCreator
import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import org.babyfish.jimmer.sql.*

@Entity
@Table(
    name = "permission"
)
interface Permission: BaseTime, BaseCreator, BaseModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Key
    val code: String

    @ManyToMany(mappedBy = "permissions")
    val roles: List<Role>
}