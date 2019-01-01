export default {
    input: 'src/index.mjs',
    output:[
        {
            file: 'dist/array-matcher.mjs',
            format: 'esm'
        },
        {
            file: 'dist/array-matcher.js',
            format: 'cjs'
        }
    ]
}