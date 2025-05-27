package com.example.model.entity.order

import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import com.example.model.entity.canteen.Food
import org.babyfish.jimmer.sql.*
import java.math.BigDecimal

@Entity
@Table(name = "order_item")
interface OrderItem : BaseTime, BaseModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    val totalNumber: Int

    val totalPrice: BigDecimal

    @Key
    @ManyToOne
    @OnDissociate(value = DissociateAction.DELETE)
    @JoinColumn(name = "order_id")
    val order: Order

    @Key
    @ManyToOne
    @OnDissociate(value = DissociateAction.DELETE)
    @JoinColumn(name = "food_id")
    val food: Food

}