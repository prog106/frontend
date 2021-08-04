## Markdown Icon

https://gist.github.com/rxaviers/7360908

---

## VS Code Extension 추천 11개

#### Meterial Theme / Mattia Astorino

    테마 변경

#### Meterial Icon Theme / Philipp Kief

    아이콘 변경

#### Prettier - Code formatter / Esben Petersen

```
만일 작동하지 않을 경우 VSCode > Preference (cmd + ,) 
- Default Formatter 검색 > Prettier - Code formatter
- editor format on save 검색 > checkbox 체크
```

    code formatter

#### Bracket Pair Colorizer / CoenraadS

    괄호 [{()}] 코드 가독성 높여줌

#### indent-rainbow / oderwat

    들여쓰기 부분 배경색 적용

#### Auto Rename Tag / Jun Han

    연관 코드 자동 수정

#### CSS Peek / Pranay Prakash

    css 바로 보기 ( ctrl + mouseover ) / 바로 가기 ( ctrl + mouseclick )

#### HTML CSS Support / ecmel

    css to html 텍스트 자동 완성

#### HTML to CSS autocompletion / solnurkarim

    html to css 텍스트 자동 완성

#### Live Server / Ritwick Dey

    브라우저 서버

#### Markdown Preview

    markdown preview 명령어 ( 기본 설치 )

#### ~~Remote Development & Remote SSH / Microsoft~~

`이 툴은 사용하면 안될듯. 서버에 2개이상 접속하니 CPU가 100% 찍음. CPU와 사용자 수 관계가 있는듯`

    SSH 실시간 원격 접속 툴
    사용방법 : VS Code 사용팁 참고

#### Emmet

-   p>lorem

    ```html
    <p>
    	Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae
    	labore expedita qui accusamus laboriosam tempora, cupiditate nulla
    	asperiores doloribus inventore libero perferendis nostrum quae officiis
    	autem maiores cum magni nesciunt?
    </p>
    ```

-   p>lorem4
    ```html
    <p>Lorem ipsum dolor sit.</p>
    ```
-   div.level
    ```html
    <div class="level"></div>
    ```
-   div.level>span.txt
    ```html
    <div class="level"><span class="txt"></span></div>
    ```
-   div.level\*3
    ```html
    <div class="level"></div>
    <div class="level"></div>
    <div class="level"></div>
    ```
-   p.class${item $}\*2
    ```html
    <p class="class1">item 1</p>
    <p class="class2">item 2</p>
    ```
-   javascript markup sample ( ```ts )
    ```ts
    console.log("hello");
    ```

---

## VS Code 설정

#### file.eol 수정

    Settings 열기 ( ctrl + , )
    searching setting에 'Eol'을 입력하여 검색

Files: Eol<br>
The default end of line character.<br>
/n :arrow_down_small:

#### insert Final Newline 체크하기

    Windows에서 작업한 파일이 Linux에서 "\ No newline at end of file" 메시지가 나오는 부분 방지하기

    Settings 열기 ( ctrl + , )
    searching setting에 'Insert Final Newline'을 입력하여 검색

Files: insert Final Newline<br>
:ballot_box_with_check: When enabled, insert a final new line at the end of the file when saving it.

#### 공백 표시하기

    Settings 열기 ( ctrl + , )
    searching setting에 'Render Whitespace'를 입력하여 검색

    - none : 공백 표시 안함
    - boundary : 공백이 2칸 이상일 경우만 공백 표시
    - (기본) selection : 드래그하여 선택된 영역에서만 공백 표시
    - (추천) trailing : 소스 코드와 상관없는, 불필요한 공백만 표시
    - all : 모든 공백 표시

---

## VS Code 사용팁

#### Remote Development & Remote SSH 사용법

    사용전 서버 Spec 을 확인하고, CPU 사용량 확인할 것.
    2개 접속했다가 서버 다운 발생.

-   VS Code prompt 열기 ( ctrl + shift + p )
-   Remote-SSH: Connect to Host... 선택
-   Configure SSH Hosts... 선택
    ```ts
    SSH 설정 정보를 저장하기 위한 경로 선택
    여러 경로중 "C:\Users\사용자\.ssh\config" 를 선택 ( 다른 경로를 선택해도 될 듯 )
    ```
    ```ts
    Host [ 별칭 ]
        HostName [ Server IP ]
        User [ 계정 ]
        IdentityFile [ pem 파일 path ]
    ```
-   하단 상태바의 제일 좌측에 "><" ( 원격 창 열기 ) 아이콘 클릭 or VS Code prompt 열기 ( ctrl + shift + p )
-   Remote-SSH: Connect to Host... 선택
-   위에서 등록한 Host 별칭 선택
    ```ts
    새로운 VS Code 가 실행되며, 하단 상태바의 제일 좌측에 ">< SSH:[ 별칭 ]" 상태로 변경되는 것을 확인
    ```
-   좌측 제일 상단 Explorer ( ctrl + shift + e ) 메뉴 선택
-   Open Folder 를 선택하여 원하는 폴더를 오픈한 후 개발을 진행

#### VS Code Git 사용법

-   branch 명령어

    ```ts
    하단 상태바의 좌측 두번째 [ git 아이콘 ] 클릭
    기본값 : [ git 아이콘 ] master
    VS Code prompt 오픈되면 명령어 선택 or 입력
    ```

-   git 명령어

    ```ts
    좌측 Source Control ( ctrl + shift + g ) 메뉴 선택 or [ git 아이콘 ]
    좌상단 메뉴에서 git 명령어 선택
    ```
