# Email

Tenzir supports sending events as email using the [`save_email`](/reference/operators/save_email) operator. To this end, the operator establishes a connection with an SMTP server that sends the message on behalf of Tenzir.

![Pipeline to email](/_astro/email.DwOnOCKn_19DKCs.svg)

## Examples

[Section titled “Examples”](#examples)

### Email the Tenzir version as CSV message

[Section titled “Email the Tenzir version as CSV message”](#email-the-tenzir-version-as-csv-message)

```tql
version
write_csv
save_email "Example User <user@example.org>"
```

### Send the email body as MIME part

[Section titled “Send the email body as MIME part”](#send-the-email-body-as-mime-part)

```tql
version
write_json
save_email "user@example.org, mime=true
```

This results in an email body of this shape:

```plaintext
--------------------------s89ecto6c12ILX7893YOEf
Content-Type: application/json
Content-Transfer-Encoding: quoted-printable


{
  "version": "4.10.4+ge0a060567b-dirty",
  "build": "ge0a060567b-dirty",
  "major": 4,
  "minor": 10,
  "patch": 4
}


--------------------------s89ecto6c12ILX7893YOEf--
```