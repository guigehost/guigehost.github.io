import paramiko
import sys

HOST = "122.51.205.39"
USER = "root"
PASS = "5201314@abC"


def run(cmd, timeout=300):
    cli = paramiko.SSHClient()
    cli.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    cli.connect(HOST, username=USER, password=PASS, timeout=20, banner_timeout=20)
    stdin, stdout, stderr = cli.exec_command(cmd, timeout=timeout, get_pty=True)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    rc = stdout.channel.recv_exit_status()
    cli.close()
    return rc, out, err


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "uptime"
    rc, out, err = run(cmd)
    if out:
        print(out, end="")
    if err:
        print(err, end="", file=sys.stderr)
    sys.exit(rc)


if __name__ == "__main__":
    main()
