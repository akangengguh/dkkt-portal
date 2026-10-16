#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/307862a71faf04a155d9cb3110b8b5df89b8d76a40162e61323b5f954c020513/contract';
import startContract from '../../snapshots/307862a71faf04a155d9cb3110b8b5df89b8d76a40162e61323b5f954c020513/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a676691d9746868d6933fe464aa9e66a46ae905011dae594e9f09c2b9d33723a/contract';
import endContract from '../../snapshots/a676691d9746868d6933fe464aa9e66a46ae905011dae594e9f09c2b9d33723a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'committee',
        column: col('chairmanArtistId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'organizationMember',
        column: col('artistId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('username', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_username_key',
        columns: ['username'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'committee',
        index: 'committee_chairmanArtistId_idx_999240aa',
        columns: ['chairmanArtistId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'organizationMember',
        index: 'organizationMember_artistId_idx_5a004db6',
        columns: ['artistId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'committee',
        foreignKey: {
          name: 'committee_chairmanArtistId_fkey',
          columns: ['chairmanArtistId'],
          references: { schema: 'public', table: 'artist', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'organizationMember',
        foreignKey: {
          name: 'organizationMember_artistId_fkey',
          columns: ['artistId'],
          references: { schema: 'public', table: 'artist', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
