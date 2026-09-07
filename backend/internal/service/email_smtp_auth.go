package service

import (
	"errors"
	"net/smtp"
	"strings"
)

// smtpAuth selects from the mechanisms advertised after TLS negotiation.
// Keep PLAIN for existing providers; LOGIN supports services such as Azure ACS.
// Never retry another mechanism after an authentication failure.
type smtpAuth struct {
	config *SMTPConfig
	plain  smtp.Auth
	step   int
}

func (a *smtpAuth) Start(server *smtp.ServerInfo) (string, []byte, error) {
	a.plain = nil
	a.step = 0
	login := false
	for _, mechanism := range server.Auth {
		if strings.EqualFold(mechanism, "PLAIN") {
			a.plain = smtp.PlainAuth("", a.config.Username, a.config.Password, a.config.Host)
			return a.plain.Start(server)
		}
		login = login || strings.EqualFold(mechanism, "LOGIN")
	}
	if !login {
		return "", nil, errors.New("smtp server offers no supported authentication mechanism")
	}
	if !server.TLS || server.Name != a.config.Host {
		return "", nil, errors.New("smtp LOGIN requires TLS and a matching server name")
	}
	return "LOGIN", nil, nil
}

func (a *smtpAuth) Next(challenge []byte, more bool) ([]byte, error) {
	if a.plain != nil {
		return a.plain.Next(challenge, more)
	}
	if !more {
		return nil, nil
	}
	prompt := strings.ToLower(strings.TrimSpace(string(challenge)))
	switch {
	case a.step == 0 && (prompt == "username:" || prompt == "user name:"):
		a.step++
		return []byte(a.config.Username), nil
	case a.step == 1 && prompt == "password:":
		a.step++
		return []byte(a.config.Password), nil
	default:
		return nil, errors.New("unexpected smtp LOGIN challenge")
	}
}
