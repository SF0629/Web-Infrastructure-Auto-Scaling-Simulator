<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
</head>
<body>

<h1>Real-Time Load Balancer & Auto Scaling Simulator</h1>

<p>
웹 환경에서 트래픽 증가에 따른 서버 부하와 오토 스케일링 과정을 시각적으로 보여주는 시뮬레이터입니다.
트래픽 급증 상황에서 서버가 어떻게 확장되고, 다시 안정화되면서 축소되는지까지 확인할 수 있도록 구현했습니다.
</p>
<br>

<h2>프로젝트 개요</h2>
<p>이 프로젝트는 다음 흐름을 시뮬레이션합니다.</p>
<ul>
    <li>클라이언트 트래픽 발생</li>
    <li>로드 밸런서를 통한 요청 분산</li>
    <li>서버 부하 증가</li>
    <li>임계치 초과 시 Auto Scaling (Scale Out)</li>
    <li>부하 감소 시 Scale Down</li>
    <li>시스템 안정화</li>
</ul>

<h2>주요 기능</h2>

<h3>1. 실시간 트래픽 생성</h3>
<ul>
    <li>기본 트래픽: 50 ~ 100 RPS</li>
    <li>Surge 모드: 500 ~ 1000 RPS</li>
    <li>100ms 단위 갱신</li>
</ul>

<h3>2. 요청 분산</h3>
<ul>
    <li>현재 서버 수 기준 균등 분산</li>
    <li>나머지 요청은 순차 배정</li>
    <li>각 서버 CPU 사용률 계산</li>
</ul>

<h3>3. 서버 상태 표시</h3>
<ul>
    <li>STABLE: CPU &lt; 70%</li>
    <li>HIGH LOAD: 70% 이상</li>
    <li>CRITICAL: 85% 이상</li>
</ul>

<h3>4. Auto Scaling (Scale Out)</h3>
<ul>
    <li>평균 CPU 80% 이상 상태 5초 유지</li>
    <li>서버 자동 추가</li>
    <li>최대 서버 수 제한 존재</li>
</ul>

<h3>5. Scale Down</h3>
<ul>
    <li>평균 CPU가 일정 기준 이하로 일정 시간 유지될 경우</li>
    <li>서버 자동 제거</li>
    <li>최소 서버 수 이하로는 감소하지 않음</li>
</ul>

<h2>시스템 구조</h2>

<pre>
Traffic Generator
        ↓
Load Balancer
        ↓
Web Servers
        ↓
Auto Scaling Controller
</pre>

<h2>구현 방식</h2>
<ul>
    <li>중앙 상태 객체 기반 관리</li>
    <li><code>setInterval</code> 기반 실시간 루프</li>
    <li>서버별 CPU 계산 로직 구현</li>
    <li>조건 기반 Scale Out / Scale Down 알고리즘</li>
    <li>상태 로직과 UI 렌더링 분리</li>
</ul>

<h2>사용 기술</h2>
<ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>Vanilla JavaScript (ES6)</li>
</ul>

<h2>실행 방법</h2>
<ol>
    <li>Start 버튼 클릭</li>
    <li>Surge Mode 활성화</li>
    <li>서버 과부하 상태 확인</li>
    <li>Auto Scaling 동작 확인</li>
    <li>트래픽 감소 후 Scale Down 확인</li>
</ol>

<h2>제작 목적</h2>
<ul>
    <li>로드 밸런싱 개념 설명</li>
    <li>수평 확장(Horizontal Scaling) 이해</li>
    <li>트래픽 대응 구조 시각화</li>
    <li>동아리 시연용 프로젝트</li>
</ul>
<h2>시연 영상</h2>
https://drive.google.com/file/d/1hitCu3RdgiLiwuF5Y1InaVcdEnwCNJGw/view?usp=drive_link

<h2>사이트</h2>
https://sf0629.github.io/Real-Time-Load-Balancer-Auto-Scaling-Simulator

</body>
</html>
