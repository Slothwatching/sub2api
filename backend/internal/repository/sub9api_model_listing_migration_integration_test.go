//go:build integration

package repository

import (
	"context"
	"fmt"
	"testing"

	dbmigrations "github.com/Wei-Shaw/sub2api/migrations"
	"github.com/stretchr/testify/require"
)

func TestSub9APIModelListingUpgradeRollbackAndReupgrade(t *testing.T) {
	tx := testTx(t)
	ctx := context.Background()
	// Recreate the deployed column shape inside a transaction, with synthetic data.
	_, err := tx.ExecContext(ctx, "ALTER TABLE groups DROP COLUMN model_allowlist")
	require.NoError(t, err)
	fixtures := []string{`{}`, `{"enabled":false,"models":["gpt-5.5"]}`, `{"enabled":true,"models":[]}`, `{"enabled":true,"models":["gpt-5.5","gpt-5.4"]}`}
	ids := make([]int64, len(fixtures))
	for i, config := range fixtures {
		require.NoError(t, tx.QueryRowContext(ctx, `INSERT INTO groups (name, models_list_config) VALUES ($1, $2::jsonb) RETURNING id`, fmt.Sprintf("compat-fixture-%d", i), config).Scan(&ids[i]))
	}
	for _, name := range []string{"234a_sub9api_model_listing_compat.sql", "235_group_model_allowlist.sql", "236_group_model_allowlist_repair.sql"} {
		body, readErr := dbmigrations.FS.ReadFile(name)
		require.NoError(t, readErr)
		_, execErr := tx.ExecContext(ctx, string(body))
		require.NoError(t, execErr, name)
	}
	for i, id := range ids {
		var display, admission string
		require.NoError(t, tx.QueryRowContext(ctx, `SELECT models_list_config::text, model_allowlist::text FROM groups WHERE id=$1`, id).Scan(&display, &admission))
		require.JSONEq(t, fixtures[i], display)
		require.JSONEq(t, `{"enabled":false}`, admission)
	}
	// The old binary can still read/write its column after upgrade. A new request
	// policy remains independent of an old-version display edit.
	_, err = tx.ExecContext(ctx, `UPDATE groups SET model_allowlist='{"enabled":true,"models":["gpt-5.5"]}', models_list_config='{"enabled":true,"models":["gpt-5.4"]}' WHERE id=$1`, ids[3])
	require.NoError(t, err)
	body, err := dbmigrations.FS.ReadFile("234a_sub9api_model_listing_compat.sql")
	require.NoError(t, err)
	_, err = tx.ExecContext(ctx, string(body))
	require.NoError(t, err)
	var display, admission string
	require.NoError(t, tx.QueryRowContext(ctx, `SELECT models_list_config::text, model_allowlist::text FROM groups WHERE id=$1`, ids[3]).Scan(&display, &admission))
	require.JSONEq(t, `{"enabled":true,"models":["gpt-5.4"]}`, display)
	require.JSONEq(t, `{"enabled":true,"models":["gpt-5.5"]}`, admission)
}
