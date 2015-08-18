Due to their size we should consider to generate the .data files during install/update.
Code could be something like this:

```php
function generate_file($fileName, $size)
{
    if ($fp = fopen($fileName, 'w+')) {
        $fileSize = 0;
        do {
            $chunk = rtrim(base64_encode(md5(microtime())), '=');
            $len = strlen($chunk);
            $fileSize += $len;

            if ($fileSize > $size) {
                $len -= $size - $fileSize;
                $fileSize = $size;
            }

            if ($len > 0) {
                fwrite($fp, $chunk, $len);
            }

        } while( $fileSize < $size );
        fclose($fp);
    }
}
```