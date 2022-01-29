import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getData } from "./server";

/**
 * 插件被激活时触发，所有代码总入口
 * @param {*} context 插件上下文
 */
exports.activate = function (context: any) {
  // vscode.window.registerTreeDataProvider("koto.helloWorld", new ListData(api));
  // 注册命令
  context.subscriptions.push(
    vscode.commands.registerCommand("koto.helloWorld", function () {
      vscode.window.showInformationMessage("koto is running!");

      const panel = vscode.window.createWebviewPanel(
        "koto", // viewType
        "koto~", // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
          enableScripts: true, // 启用JS，默认禁用
          retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
        }
      );

      getData((dataSource: any) => {
        panel.webview.postMessage({ text: dataSource });
      });

      //接收webview
      panel.webview.onDidReceiveMessage(
        (message) => {
          getData((dataSource: any) => {
            // console.log("插件收到的消息：", message);
            panel.webview.postMessage({ text: dataSource });
          });
        },
        undefined,
        context.subscriptions
      );

      panel.webview.html = getWebViewContent(
        context,
        "src/view/koto-webview.html"
      );
    })
  );
};

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context: any, templatePath: any) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  const dirPath = path.dirname(resourcePath);
  let html = fs.readFileSync(resourcePath, "utf-8");
  // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
  html = html.replace(
    /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
    (m, $1, $2) => {
      return (
        $1 +
        vscode.Uri.file(path.resolve(dirPath, $2))
          .with({ scheme: "vscode-resource" })
          .toString() +
        '"'
      );
    }
  );
  return html;
}

/**
 * 插件被释放时触发
 */
exports.deactivate = function () {
  console.log("deactivate");
};
