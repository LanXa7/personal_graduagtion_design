package com.example.model.entity.canteen

import com.example.model.common.BaseCreator
import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import com.example.model.entity.order.Order
import com.example.model.entity.user.User
import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "stall")
interface Stall : BaseTime, BaseCreator, BaseModifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    val name: String

    val directorName: String

    val directorPhone: String

    @Transient(ref = "stallFoodNumberResolver")
    val foodNumber: Long

    @OneToOne
    val user: User?

    @ManyToOne
    @JoinColumn(name = "canteen_id")
    @OnDissociate(value = DissociateAction.DELETE)
    val canteen: Canteen

    @OneToMany(mappedBy = "stall")
    val orders: List<Order>

    @OneToMany(mappedBy = "stall")
    val foods: List<Food>

    @OneToMany(mappedBy = "stall")
    val sales: List<Sales>
}