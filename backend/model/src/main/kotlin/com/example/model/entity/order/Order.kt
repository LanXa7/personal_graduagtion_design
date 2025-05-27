package com.example.model.entity.order

import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import com.example.model.entity.canteen.Stall
import com.example.model.enums.order.OrderState
import org.babyfish.jimmer.sql.*
import java.math.BigDecimal

@Entity
@Table(name = "\"order\"")
interface Order : BaseTime, BaseModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Key
    val code:String

    val totalPrice: BigDecimal

    val picture: String

    val state: OrderState

    @ManyToOne
    @JoinColumn(name = "stall_id")
    @OnDissociate(value = DissociateAction.DELETE)
    val stall: Stall

    @OneToMany(mappedBy = "order")
    val orderItems: List<OrderItem>
}