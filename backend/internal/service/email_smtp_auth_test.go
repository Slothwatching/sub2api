//go:build unit

package service

import (
	"net/smtp"
	"testing"
)

func TestSMTPAuthNegotiation(t *testing.T) {
	for _, tc := range []struct {
		name   string
		server smtp.ServerInfo
		want   string
	}{
		{"prefer plain", smtp.ServerInfo{Name: "smtp.test", TLS: true, Auth: []string{"LOGIN", "PLAIN"}}, "PLAIN"},
		{"login only", smtp.ServerInfo{Name: "smtp.test", TLS: true, Auth: []string{"LOGIN"}}, "LOGIN"},
		{"unsupported", smtp.ServerInfo{Name: "smtp.test", TLS: true, Auth: []string{"XOAUTH2"}}, ""},
		{"no tls", smtp.ServerInfo{Name: "smtp.test", Auth: []string{"LOGIN"}}, ""},
		{"wrong host", smtp.ServerInfo{Name: "other.test", TLS: true, Auth: []string{"LOGIN"}}, ""},
	} {
		t.Run(tc.name, func(t *testing.T) {
			a := &smtpAuth{config: &SMTPConfig{Host: "smtp.test", Username: "user", Password: "pass"}}
			got, _, err := a.Start(&tc.server)
			if got != tc.want || (err != nil) != (tc.want == "") {
				t.Fatalf("mechanism=%q error=%v", got, err)
			}
		})
	}
}

func TestSMTPLoginChallengeOrder(t *testing.T) {
	a := &smtpAuth{config: &SMTPConfig{Username: "user", Password: "pass"}}
	if response, err := a.Next([]byte("Password:"), true); err == nil || response != nil {
		t.Fatal("must reject a password-first challenge")
	}
	for _, tc := range [][2]string{{"Username:", "user"}, {"Password:", "pass"}} {
		response, err := a.Next([]byte(tc[0]), true)
		if err != nil || string(response) != tc[1] {
			t.Fatal("expected challenge response")
		}
	}
	if response, err := a.Next([]byte("Password:"), true); err == nil || response != nil {
		t.Fatal("must reject repeated credentials request")
	}
	if _, err := a.Next(nil, false); err != nil {
		t.Fatal(err)
	}
}
