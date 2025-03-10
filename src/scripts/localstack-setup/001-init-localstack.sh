#!/bin/bash
awslocal s3 mb s3://brp-local
awslocal s3api put-bucket-acl --bucket brp-local --acl public-read