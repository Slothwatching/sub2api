// This harness is compiled separately with the old and new repository versions.
package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	dbent "github.com/Wei-Shaw/sub2api/ent"
	"github.com/Wei-Shaw/sub2api/ent/group"
	_ "github.com/Wei-Shaw/sub2api/ent/runtime"
	"github.com/Wei-Shaw/sub2api/internal/domain"
	"github.com/Wei-Shaw/sub2api/internal/repository"
	_ "github.com/lib/pq"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	ctx := context.Background()
	db, err := sql.Open("postgres", os.Getenv("COMPAT_DATABASE_URL"))
	if err != nil {
		return err
	}
	defer db.Close()
	if err := repository.ApplyMigrations(ctx, db); err != nil {
		return err
	}
	client := dbent.NewClient(dbent.Driver(entsql.OpenDB(dialect.Postgres, db)))
	phase := os.Args[1]
	if phase == "baseline" {
		for _, name := range []string{"selected", "empty"} {
			config := domain.GroupModelsListConfig{Enabled: true}
			if name == "selected" {
				config.Models = []string{"gpt-5.5", "gpt-5.4"}
			}
			if _, err := client.Group.Create().SetName(name).SetPlatform("openai").SetModelsListConfig(config).Save(ctx); err != nil {
				return err
			}
		}
	}
	if phase == "rollback" {
		if _, err := client.Group.Update().Where(group.NameEQ("selected")).SetModelsListConfig(domain.GroupModelsListConfig{Enabled: true, Models: []string{"gpt-5.4"}}).Save(ctx); err != nil {
			return err
		}
		if _, err := client.Group.Create().SetName("rollback-created").SetPlatform("openai").SetModelsListConfig(domain.GroupModelsListConfig{Enabled: true, Models: []string{"gpt-5.5"}}).Save(ctx); err != nil {
			return err
		}
	}
	groups, err := client.Group.Query().Order(dbent.Asc(group.FieldID)).All(ctx)
	if err != nil {
		return err
	}
	expectedCount := 2
	if phase == "rollback" || phase == "reupgrade" {
		expectedCount = 3
	}
	if len(groups) != expectedCount {
		return fmt.Errorf("unexpected group count: %d", len(groups))
	}
	for _, g := range groups {
		config := g.ModelsListConfig
		if !config.Enabled {
			return fmt.Errorf("legacy display switch lost")
		}
		switch g.Name {
		case "empty":
			if len(config.Models) != 0 {
				return fmt.Errorf("empty display changed")
			}
		case "selected":
			expected := 2
			if expectedCount == 3 {
				expected = 1
			}
			if len(config.Models) != expected {
				return fmt.Errorf("display selection lost")
			}
		}
		if phase != "baseline" {
			var raw []byte
			if err := db.QueryRowContext(ctx, "SELECT model_allowlist FROM groups WHERE id=$1", g.ID).Scan(&raw); err != nil {
				return err
			}
			var policy struct {
				Enabled bool `json:"enabled"`
			}
			if err := json.Unmarshal(raw, &policy); err != nil {
				return err
			}
			if policy.Enabled {
				return fmt.Errorf("legacy display became request admission")
			}
		}
	}
	fmt.Printf("COMPAT_OK phase=%s groups=%d\n", phase, len(groups))
	return nil
}
