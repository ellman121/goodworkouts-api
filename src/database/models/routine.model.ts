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

import User from "./user.model";

@Table({ tableName: "routines" })
export default class Routine extends Model<
  InferAttributes<Routine>,
  InferCreationAttributes<Routine>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @Column({ type: DataType.STRING })
  declare name: string;

  @Column({ type: DataType.UUID })
  declare exercises: string[];

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  declare userId: string;
}
