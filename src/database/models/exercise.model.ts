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
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { User } from "./user.model";

@Table({ tableName: "exercises" })
export class Exercise extends Model<
  InferAttributes<Exercise>,
  InferCreationAttributes<Exercise>
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  declare userId: string;
}
