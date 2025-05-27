package com.example.model.entity.canteen

import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import org.babyfish.jimmer.sql.*

@Entity
@Table(
    name = "sales"
)
interface Sales : BaseModifier, BaseTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    val number: Int

    @OneToOne
    @JoinColumn(name = "food_id")
    val food: Food

    @ManyToOne
    @OnDissociate(value = DissociateAction.DELETE)
    @JoinColumn(name = "stall_id")
    val stall: Stall
}