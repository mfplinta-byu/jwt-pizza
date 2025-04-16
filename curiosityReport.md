# Curiosity Report

### Meet Nix!

Nix is, according to their own website, a reproducible and declarative tool and programming language to instantiate Linux services [1]. Instead of taking care of scripts manually, Nix contains an open-source repository with thousands of Nix recipes to both build and configure packages to your heart’s content.

### My experience with Nix

My experimentation with this tool started in 2022 when I was looking for the ideal Linux distribution to use on my computer. For anyone who dealt with the task of using GNU/Linux as their primary operating system, it is a daunting task that involves manually configuring dozens of files. Just to have usable defaults, you need to go through multiple tutorials and the entire configuration is impossible to reproduce without the need of an external tool such as Ansible.

NixOS takes the power of Nix to the entire system so you can configure an entire desktop or server declaratively, spinning up a SSH server or configuring a desktop manager in just a few lines. Besides that, the configuration is atomic and you can rollback the system easily.

### A small example

Apart from configuring and partitioning disks, which is stateful by nature, here is an example of a Nix configuration to instantiate a basic system. [2]

```nix
    { config, pkgs, ... }: {
      imports = [
        # Include the results of the hardware scan.
        ./hardware-configuration.nix
      ];

      boot.loader.grub.device = "/dev/sda";   # (for BIOS systems only)
      boot.loader.systemd-boot.enable = true; # (for UEFI systems only)

      # Enable the OpenSSH server.
      services.sshd.enable = true;
    }
```

### A match made in heaven

This stateless and atomic nature of Nix makes it ideal to be used alongside other tools such as Docker, or through NixOS’s own container configuration using `systemd-nspawn` [3] that also uses namespaces and layered filesystems to isolate services.

### Sources

[1] [https://nixos.org](https://nixos.org/)

[2] [https://nixos.org/manual/nixos/stable/#sec-installation-summary](https://nixos.org/manual/nixos/stable/#sec-installation-summary)

[3] [https://wiki.nixos.org/wiki/NixOS_Containers](https://wiki.nixos.org/wiki/NixOS_Containers)
