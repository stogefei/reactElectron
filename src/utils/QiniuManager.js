const qiniu = require('qiniu')
const axios = require('axios')
const fs = require('fs')

class QiniuManager {
    constructor(accessKey,secretKey,bucket) {
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        this.bucket = bucket
        this.config = new qiniu.conf.Config();
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0;
        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    }
    // 上传文件
    uploadFile(key, localFilePath) {
        const options = {
            scope: this.bucket + ":" + key,
          }
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken= putPolicy.uploadToken(this.mac);
        const formUploader = new qiniu.form_up.FormUploader(this.config);
        const putExtra = new qiniu.form_up.PutExtra();
        return new Promise((resolve, reject) => {
            // 文件上传
            formUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallback(resolve, reject));
        }) 
    }
    //空间状态
    getStat(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.stat(this.bucket, key, this._handleCallback(resolve, reject))
        })
    }
    //文件下载
    downloadFile(key, downloadPath) {
        return this.generateDownloadLink(key).then(link => {
            const timeStamp = new Date().getTime()
            const url = `${link}?timestamp=${timeStamp}`
            return axios({
                url,
                method: 'GET',
                responseType: 'stream',
                header: {'Cache-Control': 'no-cache'}
            })
        })
        .then(response => {
            const writer = fs.createWriteStream(downloadPath) //可写文件
            response.data.pipe(writer) // 管道导出
            // console.log(response.data,'response') 
            return new Promise((resolve, reject) => {
                writer.on('finish', resolve)
                writer.on('error', reject)
            })
        })
        .catch(err => {
             console.log(err,'err')
             return new Promise.reject({err: err.response})
        })
    }
    // 空间下载地址
    getBucketDomain() {
        const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
        const digest = qiniu.util.generateAccessToken(this.mac, reqURL)
        console.log('trigger here')
        return new Promise((resolve, reject) => {
          qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallback(resolve, reject))
        })
    }
    // 获取下载地址
    generateDownloadLink(key) {
        const domainPromise = this.publicBucketDomain ? 
        Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
        return domainPromise.then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const pattern = /^https?/
            this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`
            return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key)
          } else {
            throw Error('域名未找到，请查看存储空间是否已经过期')
          }
        })
      }
    // 删除空间文件
    deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.delete(this.bucket, key, this._handleCallback(resolve, reject));
        })
    }
    // 回调
    _handleCallback(resolve, reject) {
            return (respErr, respBody,respInfo) => {
                if (respErr) {
                    throw respErr;
                }
                if (respInfo.statusCode === 200) {
                    resolve(respBody);
                } else {
                    reject({
                        status: respInfo.statusCode,
                        body: respBody
                    });
                }
            }

        }
    }

module.exports = QiniuManager