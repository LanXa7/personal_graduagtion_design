package com.example.model.entity.user

import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import com.example.model.entity.canteen.Canteen
import com.example.model.entity.canteen.Stall
import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "\"user\"")
interface User : BaseTime, BaseModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Key
    val username: String

    val phone: String

    val password: String

    @Key
    val email: String

    val avatar: String?

    @ManyToMany
    @JoinTable(
        name = "user_role_mapping",
        joinColumnName = "user_id",
        inverseJoinColumnName = "role_id",
    )
    val roles: List<Role>

    @OneToOne(mappedBy = "user")
    val canteen: Canteen?

    @OneToOne(mappedBy = "user")
    val stall: Stall?

}