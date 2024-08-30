import R from "ramda";
import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import {
  Model,
  Column,
  DataType,
  Table,
  ForeignKey,
} from "sequelize-typescript";

import Exercise from "./exercise.model";

type RepWeight = [number, number];

@Table({ tableName: "sets" })
export default class ExerciseSet extends Model<
  InferAttributes<ExerciseSet>,
  InferCreationAttributes<ExerciseSet>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => Exercise)
  @Column({ type: DataType.UUID })
  declare exerciseId: string;

  @Column({ type: DataType.ARRAY(DataType.ARRAY(DataType.NUMBER)) })
  set reps(value: RepWeight[]) {
    if (R.any((v) => v.length !== 2, value)) 
      throw new Error("Reps must be an array of 2-tuples");
    

    this.setDataValue("reps", value);
  }
}
