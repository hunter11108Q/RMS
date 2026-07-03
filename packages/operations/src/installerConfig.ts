export interface NsisInstallerManifest {
  appName: string;
  appId: string;
  installDirectory: string;
  shortcuts: {
    desktop: boolean;
    startMenu: boolean;
  };
  silentInstall: boolean;
  allowDirectorySelection: boolean;
}

export const getDesktopBuilderConfig = (): any => {
  return {
    appId: 'com.rms.pos',
    productName: 'RMS POS Terminal',
    directories: {
      output: 'dist-installer',
    },
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64', 'ia32'],
        },
      ],
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: 'always',
      createStartMenuShortcut: true,
      shortcutName: 'RMS POS Terminal',
      uninstallDisplayName: 'Uninstall RMS POS Terminal',
    },
  };
};
