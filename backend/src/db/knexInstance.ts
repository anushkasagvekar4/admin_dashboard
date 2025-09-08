import knexInit, { Knex } from "knex";
import config from "./knexfile";

const knex: Knex = knexInit(config.development);

export default knex;
