import subprocess
import sys

def run_command(command):
    print(f"\nExecuting: {command}")
    process = subprocess.Popen(command, shell=True)
    process.communicate()
    if process.returncode != 0:
        print(f"Error while executing: {command}")
        sys.exit(process.returncode)

def main():

    run_command("npm install")

    run_command("npm run build")

    run_command("npx prisma db push")


    run_command("npm run tauri dev")

if __name__ == "__main__":
    main()
