import gulp from 'gulp';
import DIR, {
    PATH
} from './Dir';
const del = require('del');
/* css 세팅을 위한 모듈 세개를 임포트 합니다. */
import Cache from 'gulp-file-cache';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import webpack from 'gulp-webpack';//걸프에서 사용할 웹팩
import fs from 'fs';//파일시스템
// 파일 시스템은 기본적으로 클라이언트 언어인 javascript 에서는 지원하지 않았었으나 
// nodeJS 는 서버에서 사용되는 언어라서 활용할 수 있습니다. fs모듈은 설치할 필요없이 
// 기본으로 지원되는 모듈이니 바로 임포트 할 수 있습니다.

const cache = new Cache(); // 캐시 모듈을 사용하기위래 new 연산자로 변수를 생성합니다. 
gulp.task('css:sass', () => {
    console.log('sass in');
    return new Promise(resolve => {
        // scss 폴더로 접근하기 위해 gulp.src를 사용합니다. scss 폴더 내의 최상위 파일만 선택합니다. 
        gulp.src(`${ PATH.DIR.SRC }/scss/*.scss`)
            .pipe(cache.filter()) // 이미 캐시에 있는 파일을 필터링하는 스트림을 만듭니다. 
            .pipe(sass()) // 불러온 scss 파일들을 sass 모듈로 컴파일 합니다. 
            .pipe(cache.cache()) // 캐시 파일에 스트림 파일을 캐시합니다. 
            .pipe(gulp.dest(`${ PATH.DIR.SRC }/css`)); // 완성된 scss 파일을 css 폴더로 옮깁니다.

        resolve();
    });
});



gulp.task('css:css', () => {
    console.log('css in');
    return new Promise(resolve => {
        gulp.src(`${ PATH.SRC.CSS }`) // html 폴더내의 css 폴더를 선택합니다. 
        .pipe(cache.filter())
        /* ie8 대응을 위한 추가입니다. 필요없다면 추가하지 않아도 됩니다. */
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(cache.cache())
        .pipe(gulp.dest(`${ PATH.DEST.CSS }`)); // 배포 폴더로 css 파일을 복사해줍니다.

        resolve();
    });
});
// gulp.series를 활용하여 두 개의 task를 변수 css에 담습니다. 
// css에서 활용할 task 이름들은 구분하기 쉽도록 작성합니다. 
const css = gulp.series('css:sass', 'css:css');


let clean_old = () => {
    console.log('clean in');
    return new Promise(resolve => {
        /* Dir.js 로부터 전달받은 PATH 변수로부터 html_build 문자열을 받아옵니다. */
        del.sync(PATH.DIR.DEST); // PATH.DIR.DEST ==> html_build
        resolve();
    });
}



let js = () => {
    console.log('js in');
    return new Promise(resolve => {
        // fs 를 활용하여 정해진 디렉토리를 검색하게합니다. 
        fs.readdir(`${ PATH.DIR.SRC }/js/`, (err, files) => {
            console.log('err : ', err); // 혹시 에러가 발생할지 확인합니다. 
            console.log('files : ', files); // 파일이름들을 배열로 반환합니다. 
            files.forEach(file => {
                console.log('- file : ', file);
                let evt = {
                    path: `${ __dirname }\\${ PATH.DIR.SRC }\\js\\${ file }`
                };

                webpackFunc(evt); // 변수 evt 를 webpackFunc함수에 전달합니다. 
            });
        });
        resolve();
    });
}



// 코드 추가 
function webpackFunc(evt) {
    // 파일 경로와 파일 이름을 변수로 지정하였습니다. 
    let path = evt.path;
    // 경로중 파일이름만을 문자열로 잘라내어 변수에 담았습니다. 
    let jsName = path.substr(path.lastIndexOf('\\') + 1, path.length);
    // 임포트 했던 weback을 세팅합니다. 
    webpack({
        entry: {
            entryName: `${ __dirname }/view/js/${ jsName }` // 파일 경로를 설정합니다. 
        },
        output: {
            filename: jsName // 만들어질 파일명을 설정합니다. 
        },
        module: { // 모둘 세팅 
            // 이곳에서 사용되는 모듈 과 플러그인들은 이전 포스팅에서모두 설치한 모듈들입니다. 
            // 이모듈들은 ES 6 ~ 7 그리고 그 이상의 기술들을 사용하였을때 바벨이 오류를 뱉어내어 컴파일에 
            // 실패하지 않기 위해 필요한 모듈들 모음입니다. 
            loaders: [{
                test: /\.js$/,
                loader: 'babel-loader', // 바벨로더를 사용합니다. 
                exclude: '/node_modules/',
                query: {
                    cacheDirectory: true,
                    "presets": ['es2015', 'es2017', 'stage-3', 'react'], // 사용할 프리셋들
                    // 프리셋 관련 정보는 https://babeljs.io/docs/en 에서 확인하실 수 있습니다. 
                    "plugins": [
                        'transform-decorators-legacy',
                        'transform-class-properties',
                        'transform-async-to-generator',
                        'transform-object-assign',
                        'transform-regenerator',
                        ["transform-runtime", {
                            "helpers": false, // defaults to true 
                            "polyfill": false, // defaults to true 
                            "regenerator": true, // defaults to true 
                            "moduleName": "babel-runtime" // defaults to "babel-runtime" 
                        }]
                    ],
                }
            }]
        }
    }).pipe(gulp.dest(PATH.DEST.JS)); // 컴파일이 끝난 파일을 지정된 폴더에 생성합니다. 
    // PATH.DEST.JS 경로는 html_build/js 로 지정되어있습니다. 
}



let ejsSet = () => {
    console.log('ejsSet in');
    return new Promise(resolve => {
        gulp.src(PATH.SRC.EJS)
            .pipe(gulp.dest(PATH.DEST.EJS));

        resolve();
    });
}


gulp.task('default', gulp.series(clean_old, css, js, ejsSet));