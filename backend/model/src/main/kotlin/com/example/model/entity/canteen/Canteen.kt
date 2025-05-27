package com.example.model.entity.canteen

import com.example.model.common.BaseCreator
import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import com.example.model.entity.user.User
import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "canteen")
interface Canteen : BaseTime, BaseCreator, BaseModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    val name: String

    val directorName: String

    val directorPhone: String

    val address: String

    @Transient(ref = "canteenStallNumberResolver")
    val stallNumber: Long

    @OneToOne
    val user: User?

    @OneToMany(mappedBy = "canteen")
    val stalls: List<Stall>
}