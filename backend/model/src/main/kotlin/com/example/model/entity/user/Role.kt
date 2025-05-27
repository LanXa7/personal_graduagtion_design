package com.example.model.entity.user

import com.example.model.common.BaseCreator
import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import com.example.model.enums.Role
import org.babyfish.jimmer.sql.*

@Entity
@Table(
    name = "role"
)
interface Role : BaseTime, BaseCreator, BaseModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Key
    val code: Role

    @ManyToMany(mappedBy = "roles")
    val users: List<User>

    @ManyToMany
    @JoinTable(
        name = "role_permission_mapping",
        joinColumnName = "role_id",
        inverseJoinColumnName = "permission_id",
    )
    val permissions: List<Permission>

}