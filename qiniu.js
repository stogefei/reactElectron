// const qiniu = require('qiniu')
const QiniuManager = require('./src/utils/QiniuManager')
const path = require('path')


var accessKey = 'DpgMoQO3Sqo5uI4ToNjAuH7JtMISKBiFRtW8Wp3D';
var secretKey = 'W8ZihL1TAyIuGUyoX1QiuTBBKqyLUvMqByE6lvqw';
var localFile = "C:/Users/zhuaofei/Desktop/新建文件夹/阿斯顿.md";
var key='阿斯顿.md';

const manager = new QiniuManager(accessKey, secretKey, 'stoge')
const downloadPath = path.join(__dirname, key)

// manager.uploadFile(key,localFile)
//     .then(res => {
//         console.log(res, '上传成功')
//     })
//     .catch(err => {
//         console.log(err, 'res')
//     })

// manager.getBucketDomain()
//     .then((data) => {
//         console.log(data, '空间下载地址')
//     })
//     .catch(err => {
//         console.log(err, 'res')
//     })

// manager.generateDownloadLink('阿斯顿.md')
//     .then((data) => {
//         console.log(data, '空间下载地址')
//     })
//     .catch(err => {
//         console.log(err, 'res')
//     }) 

manager.downloadFile(key,downloadPath)
    .then((data) => {
        console.log('文件下载成功')
    })
    .catch(err => {
        console.log('文件下载失败')
    }) 

// manager.deleteFile('阿斯顿.md')
//     .then(res => {
//         console.log(res, '删除成功')
//     })
//     .catch(err => {
//         console.log(err, 'res')
//     })

// var publicBucketDomain = 'https://www.stoge.cn';
// 公开空间访问链接
// var publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key);
// console.log(publicDownloadUrl);
  
