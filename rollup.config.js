import package_json from './package.json';
const banner = `
/*
 * @mizu-mizu/array-matcher.js VERSION ${package_json.version}
 * Released under the MIT License.
 *   https://github.com/uiui611/array-matcher/blob/master/LICENSE
 */
`;
function transform(code, id){
    return code.split(/\r?\n/g)
        .map(line=>line.trim())
        .filter(line=>!/[\/ ]?\*/.test(line.substring(0, 2)))
        .filter(line=>line.trim().length)
        .join('\n');
}
export default {
    input: 'src/index.mjs',
    output:[
        {
            file: 'dist/array-matcher.mjs',
            format: 'esm',
            banner
        },
        {
            file: 'dist/array-matcher.js',
            format: 'cjs',
            banner
        }
    ],
    plugins:[ {transform } ]
}