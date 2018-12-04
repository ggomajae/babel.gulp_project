import gulp from 'gulp';
import DIR, {
    PATH
} from './Dir';
const del = require('del');
/* css 세팅을 위한 모듈 세개를 임포트 합니다. */
import Cache from 'gulp-file-cache';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';


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
gulp.task('default', gulp.series(clean_old, css));