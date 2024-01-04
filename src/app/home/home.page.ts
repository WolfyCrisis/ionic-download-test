import { Component } from '@angular/core';
import { FileSharer } from '@byteowls/capacitor-filesharer';
import { Capacitor, CapacitorHttp, HttpResponse } from '@capacitor/core';
import { ConfirmResult, Dialog } from '@capacitor/dialog';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  progressBar = 0;

  constructor() {}

  downloadFile(type: 'image' | 'pdf' | 'video') {
    const platform = Capacitor.getPlatform();
    let fileName = '';
    let fileType = '';
    let fileUrl = '';

    switch (type) {
      case 'image':
        fileName = 'Diona_Birthday_2021';
        fileType = '.png';
        fileUrl =
          'https://pbs.twimg.com/media/Er-7JobXUAc-To6?format=png&name=4096x4096';
        break;
      case 'pdf':
        fileName = 'sample';
        fileType = '.pdf';
        fileUrl = 'https://www.africau.edu/images/default/sample.pdf';
        break;
      case 'video':
        fileName = 'A Thousand Miles - Neco arc (FULL VERSION)';
        fileType = '.mp4';
        fileUrl =
          'https://cdn.discordapp.com/attachments/612567806906728469/1192021032027037716/A_Thousand_Miles_-_Neco_arc_FULL_VERSION.mp4?ex=65a78f18&is=65951a18&hm=55e74f84df7ba24f39ade0dd36c6229f3dfa7e9ced6e38ace496f75a5182a003&';
        break;
    }

    Dialog.confirm({
      message: `Do you want to download the ${type}?`,
    }).then(async (res: ConfirmResult) => {
      if (res.value) {
        switch (platform) {
          case 'web':
            switch (type) {
              case 'image':
                CapacitorHttp.get({
                  url: fileUrl,
                  responseType: 'arraybuffer',
                }).then((res: HttpResponse) => {
                  const contentType = res.headers['content-type'];
                  const data = res.data;

                  let a = document.createElement('a');
                  a.href = `data:${contentType};base64,${data}`;
                  a.download = `${fileName}${fileType}`;
                  a.target = '_blank';
                  a.rel = 'noopener noreferrer';
                  a.click();
                });
                break;
              case 'pdf':
              case 'video':
                // Use this instead of the above, if got CORS problems.
                window.open(fileUrl, '_blank', 'noopener noreferrer');
                break;
            }
            break;
          case 'android':
            const id = Math.floor(Math.random() * 999999);
            const count = await this.checkFileExist(fileName);

            LocalNotifications.schedule({
              notifications: [
                {
                  id,
                  title: `${fileName}${
                    count > 0 ? ` (${count})` : ''
                  }${fileType}`,
                  body: 'Downloading...',
                  channelId: 'no-sound',
                  ongoing: true,
                },
              ],
            }).then(() => {
              Filesystem.downloadFile({
                url: fileUrl,
                path: `${fileName}${count > 0 ? ` (${count})` : ''}${fileType}`,
                directory: Directory.Documents,
              }).then(() => {
                LocalNotifications.schedule({
                  notifications: [
                    {
                      id,
                      title: `${fileName}${
                        count > 0 ? ` (${count})` : ''
                      }${fileType}`,
                      body: 'Download Completed!',
                      ongoing: false,
                    },
                  ],
                });
              });
            });
            break;
          case 'ios':
            break;
        }
      }
    });
  }

  async checkFileExist(fileName: string) {
    const dir = await Filesystem.readdir({
      directory: Directory.Documents,
      path: '',
    });
    const count = dir.files.filter((val) => val.name.includes(fileName)).length;

    return count;
  }
}
