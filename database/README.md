# How to set up MySQL (For Windows)

1. Download the **MySQL MSI installer** from MySQL Community Server. (macOS users: download the **DMG installer** instead.)
2. Install MySQL on the computer.
3. After installation, open the **MySQL Configurator**.
4. Follow the configurator's instructions, set a root password and remember it.
5. (Windows only) Add MySQL's `bin` folder to PATH:
   * Find the path to the `bin` (usually `C:\Program Files\MySQL\MySQL Server 26.7\bin`).
   * Open **System Properties** (press `Win + R` -> type `sysdm.cpl`).
   * Go to **Advanced -> Environment Variables**.
   * Uner **System variables**, find `Path` -> click **Edit**.
   * Click **New** and paste the path you just found.
   * Save and close all dialogs.

---

# How to create the database

1. Open a new Command Prompt and type: `mysql -u root -p`. If the Prompt asks for your password, it means MySQL can run properly.
2. On the Prompt, navigate to the project folder
3. 
