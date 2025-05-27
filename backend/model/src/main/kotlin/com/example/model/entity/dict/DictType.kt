package com.example.model.entity.dict

import com.example.model.common.BaseCreator
import com.example.model.common.BaseModifier
import com.example.model.common.BaseTime
import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "dict_type")
interface DictType : BaseTime, BaseCreator, BaseModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Key
    val code: String

    @OneToMany(mappedBy = "type")
    val data: List<DictData>
}