package com.example.model.entity.canteen

import com.example.model.common.BaseCreator
import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import com.example.model.entity.order.OrderItem
import org.babyfish.jimmer.sql.*
import java.math.BigDecimal

@Entity
@Table(name = "food")
interface Food : BaseTime, BaseCreator, BaseModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    val name: String

    @Key
    val code: String

    val price: BigDecimal

    val picture: String

    val description: String?

    @ManyToOne
    @JoinColumn(name = "stall_id")
    @OnDissociate(value = DissociateAction.DELETE)
    val stall: Stall

    @OneToMany(mappedBy = "food")
    val orderItems: List<OrderItem>

    @OneToOne(mappedBy = "food")
    val sales: Sales?
}