package com.example.model.entity.dict

import com.example.model.common.BaseCreator
import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "dict_data")
interface DictData : BaseTime, BaseCreator, BaseModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    val label: String

    @Key
    val value: String

    @Key
    @ManyToOne
    @JoinColumn(name = "type_id")
    val type: DictType
}