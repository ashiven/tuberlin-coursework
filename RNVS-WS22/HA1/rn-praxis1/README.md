# Rechnernetzte - Praxisaugabe 1

## Build and Run Instructions
```
$ ./build.sh                    // Building
$ ./build/webserver <Port>      // Running
```

## Git Commands Overview

Git commands needed:

```
git pull    // pulls current version from gitlab to you pc, always do this before you modify anything
git status  // shows what files were modified and untracked or added already
git add <files>                  // adds modified files specified to be committed 
                                    (use * or . instead of specific files to add everything)
git commit -m "<commit message>" // commits the changes, does not yet push them to gitlab
git push    // pushes current commits to gitlab
```